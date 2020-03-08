export const StatusSuccess = "✅";
export const StatusFailed = "❌";
export const StatusNeutral = "⬜️";

export const StatusIconDescription: string = `\n\n\n\n
## Status icon desctiptions

Icon | Description
-- | --
${StatusSuccess} | Check passed successfully
${StatusNeutral} | An optional check failed, this will require a manual review
${StatusFailed} | Check failed, this needs to be corrected before the PR can be merged

## Checks
`;
