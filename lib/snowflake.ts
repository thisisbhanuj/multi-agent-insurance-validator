import snowflake from "snowflake-sdk";

// Snowflake connection configuration
const connectionConfig = {
  account: process.env.SNOWFLAKE_ACCOUNT!,
  username: process.env.SNOWFLAKE_USER!,
  password: process.env.SNOWFLAKE_PASSWORD!,
  role: process.env.SNOWFLAKE_ROLE!,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
  database: process.env.SNOWFLAKE_DATABASE!,
  schema: process.env.SNOWFLAKE_SCHEMA!,
};

export const STAGE = process.env.SNOWFLAKE_STAGE!;

// Create a connection pool
let connection: snowflake.Connection | null = null;

export async function getConnection(): Promise<snowflake.Connection> {
  if (connection && connection.isUp()) {
    return connection;
  }

  return new Promise((resolve, reject) => {
    connection = snowflake.createConnection(connectionConfig);
    connection.connect((err, conn) => {
      if (err) {
        console.error("Failed to connect to Snowflake:", err);
        reject(err);
      } else {
        resolve(conn);
      }
    });
  });
}

export async function executeQuery<T = Record<string, unknown>>(
  sql: string
): Promise<T[]> {
  const conn = await getConnection();
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error("SQL execution error:", err);
          reject(err);
        } else {
          resolve((rows || []) as T[]);
        }
      },
    });
  });
}

// Retry logic for stage queries (gives Snowflake time to index files)
export async function fetchWithRetry<T = Record<string, unknown>>(
  sql: string,
  retries = 6,
  delay = 2000
): Promise<T> {
  const refreshSql = `ALTER STAGE ${STAGE} REFRESH`;

  for (let i = 0; i < retries; i++) {
    await executeQuery(refreshSql);
    const rows = await executeQuery<T>(sql);
    if (rows.length > 0) {
      return rows[0];
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("File not found in stage after retries");
}

// Driver License extraction using AI_EXTRACT
export async function extractDriverLicense(filePath: string) {
  const sql = `
    SELECT
        RESULT:response:"full_name"::STRING AS full_name,
        RESULT:response:"dl_number"::STRING AS dl_number,
        RESULT:response:"date_of_birth"::STRING AS date_of_birth,
        RESULT:response:"address"::STRING AS address
    FROM (
        SELECT AI_EXTRACT(
            file => TO_FILE('@${STAGE}', s.relative_path),
            responseFormat => {
                'full_name': 'Full name on the license',
                'dl_number': 'Driver license number',
                'date_of_birth': 'Date of birth',
                'address': 'Address on the license'
            }
        ) AS RESULT
        FROM DIRECTORY(@${STAGE}) s
        WHERE s.relative_path = '${filePath}')
  `;

  const row = await fetchWithRetry<{
    FULL_NAME: string;
    DL_NUMBER: string;
    DATE_OF_BIRTH: string;
    ADDRESS: string;
  }>(sql);

  return {
    full_name: row.FULL_NAME,
    dl_number: row.DL_NUMBER,
    date_of_birth: row.DATE_OF_BIRTH,
    address: row.ADDRESS,
  };
}

// Claim extraction using AI_EXTRACT
export async function extractClaim(filePath: string) {
  const sql = `
    SELECT
        RESULT:response:"customer_id"::STRING AS customer_id,
        RESULT:response:"full_name"::STRING AS full_name,
        RESULT:response:"dl_number"::STRING AS dl_number,
        RESULT:response:"incident_date"::STRING AS incident_date,
        RESULT:response:"vin"::STRING AS vin,
        RESULT:response:"vehicle"::STRING AS vehicle,
        RESULT:response:"description"::STRING AS description
    FROM (
        SELECT AI_EXTRACT(
            file => TO_FILE('@${STAGE}', s.relative_path),
            responseFormat => {
                'customer_id': 'Customer ID',
                'full_name': 'Full name',
                'dl_number': 'Driver license number',
                'incident_date': 'Date of incident',
                'vin': 'Vehicle number or VIN',
                'vehicle': 'Vehicle involved',
                'description': 'Description of the claim'
            }
        ) AS RESULT
        FROM DIRECTORY(@${STAGE}) s
        WHERE s.relative_path = '${filePath}'
    )
  `;

  const row = await fetchWithRetry<{
    CUSTOMER_ID: string;
    FULL_NAME: string;
    DL_NUMBER: string;
    INCIDENT_DATE: string;
    VIN: string;
    VEHICLE: string;
    DESCRIPTION: string;
  }>(sql);

  const result: Record<string, string> = {
    customer_id: row.CUSTOMER_ID,
    full_name: row.FULL_NAME,
    dl_number: row.DL_NUMBER,
    incident_date: row.INCIDENT_DATE,
    vin: row.VIN,
    vehicle: row.VEHICLE,
    description: row.DESCRIPTION,
  };

  // Extract color from description
  const text = result.description || "";
  const match = text.match(/Color:\s*(.+?)(,|$)/i);
  if (match) {
    result.vehicle_color = match[1].trim();
  }

  return result;
}

// Get customer policy from database
export async function getCustomerPolicy(customerId: string) {
  const sql = `
    SELECT VIN, POLICY_END
    FROM CUSTOMER_POLICY
    WHERE CUSTOMER_ID = '${customerId}'
  `;

  const rows = await executeQuery<{
    VIN: string;
    POLICY_END: string;
  }>(sql);

  if (rows.length === 0) {
    throw new Error("Customer not found");
  }

  return {
    vin: rows[0].VIN,
    policy_end: new Date(rows[0].POLICY_END),
  };
}
