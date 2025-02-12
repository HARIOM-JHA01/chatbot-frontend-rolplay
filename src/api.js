import axios from "axios";

const API_URL = "http://134.122.17.151/api";

export const generateResponse = async (prompt) => {
  try {
    const response = await axios.post(`${API_URL}/generate`, {
      model: "llama3.2", 
      prompt: prompt,
      stream: false,
    });
    return response.data.response;
  } catch (error) {
    console.error("Error:", error);
    return "Error generating response.";
  }
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const base64File = await toBase64(file);
    const response = await axios.post(`${API_URL}/embeddings`, {
      model: "llama3.2",
      prompt: base64File,
    });
    return response.data.embedding;
  } catch (error) {
    console.error("File upload error:", error);
    return "Error uploading file.";
  }
};

const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
