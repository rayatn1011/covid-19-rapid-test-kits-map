export default (input) => {
  const lines = input.split("\n");
  const header = lines[0].split(",");
  const output = lines.slice(1).map((line) => {
    const fields = line.split(",");
    return Object.fromEntries(header.map((h, i) => [h, fields[i]]));
  });
  return output;
};
