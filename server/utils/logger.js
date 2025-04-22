export const log = (label, message) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${label}: ${message}`);
};

export const error = (label, err) => {
  const time = new Date().toISOString();
  console.error(`[${time}] ❌ ${label} Error:`, err);
};
