const parseJSON = (jsonString: any) => {
  try {
    // Check if the string starts and ends with quotes
    // const hasExtraQuotes =
    //   jsonString.startsWith('"{') && jsonString.endsWith('}"');

    // // Remove the extra quotes if they are present
    // const sanitizedString = hasExtraQuotes
    //   ? JSON.stringify(jsonString.slice(1, -1))
    //   : jsonString;

    // Parsing the string to a JSON object
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
  } catch (error) {
    // Handling any parsing errors
    console.error("Error parsing JSON:", error);
    console.error("json", JSON.stringify(jsonString));
    return null;
  }
};
export default parseJSON;
