import axiosClient from "./axiosClient";

export async function listarMonitores() {
    const response = await axiosClient.get("/monitores")
    console.log(response)
    return response.data
}