const parseJSON = (jsonString: any) => {
  try {
    if (typeof jsonString === "string") {
      return JSON.parse(JSON.parse(jsonString));
    } else {
      return jsonString;
    }
  } catch (error) {
    console.log("error:", error);
    return null;
  }
};
export default parseJSON;
