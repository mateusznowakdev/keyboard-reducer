import FormControl from "react-bootstrap/FormControl";

export function Input({ onChange, value }) {
  return <FormControl as="textarea" onChange={onChange} rows={6} value={value}></FormControl>;
}
