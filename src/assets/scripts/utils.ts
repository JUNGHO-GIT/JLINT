// utils.ts

// fnLogger -------------------------------------------------------------------------------
export const fnLogger = (
  fileExt: string,
  functionName: string,
  type: "Y" | "N" | "E" | "M",
  extra?: string
) => {
  const prefix = `------------------------\n`;
  const baseMsg = `[${fileExt}] '${functionName}'`;

  type === "Y" && console.log(`${prefix} ${baseMsg} Activated!`);
  type === "N" && console.log(`${prefix} ${baseMsg} Not Supported!`);
  type === "E" && console.error(`${prefix} ${baseMsg} Error!\n${extra || ""}`);
	type === "M" && console.log(`${prefix} ${baseMsg} ${extra || ""}`);
};