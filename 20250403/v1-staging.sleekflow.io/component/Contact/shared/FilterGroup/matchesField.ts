export function matchesField(fieldName: string) {
  return (field: { fieldName: string }) => field.fieldName === fieldName;
}
