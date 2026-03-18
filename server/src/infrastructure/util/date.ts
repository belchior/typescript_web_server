
export const isISOString = (value: string) => {
  return value.search(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/) >= 0
}
