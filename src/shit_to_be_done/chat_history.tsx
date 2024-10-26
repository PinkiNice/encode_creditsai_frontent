"use client";

import Image from "next/image";
import styles from "./page.module.css";

import { Button, Typography, TextField, CircularProgress } from "@mui/material";

import { useState } from "react";
import { ethers } from "ethers";

import axios from "axios";

export default function Home() {
  const [response, setResponse] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [responseHistory, setResponseHistory] = useState([]);

  const signRequest = async (request) => {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      var provider = new ethers.providers.Web3Provider(window.ethereum);

      var signer = provider.getSigner();
      var msg_to_sign = JSON.stringify(request);
      var address = await signer.getAddress();
      try {
        var signed = await signer.signMessage(msg_to_sign);
        return [address, signed];
      } catch (e) {
        setIsProcessing(false);
        alert("Error signing, please try again.");
      }
    } else {
      setIsProcessing(false);
      alert("Please install metamask.");
    }
  };

  const submitRequest = async () => {
    setIsProcessing(true);
    var request_body = { message: userPrompt };
    var signResponse = await signRequest(request_body);
    var address = signResponse[0];
    var signed = signResponse[1];

    var apiResponse = await axios.post(
      "http://localhost:8000/chat",
      request_body,
      {
        headers: {
          nkeypass_signed_request: signed,
          nkeypass_address: address,
        },
      }
    );
    setResponse(apiResponse["data"]["response"]);
    setIsProcessing(false);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div
          style={{
            minHeight: "80%",
          }}
        >
          {responseHistory.map((x) => {
            <Typography>{x}</Typography>;
          })}
          {isProcessing ? <CircularProgress /> : null}
        </div>
        <TextField
          multiline
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          onKeyUp={(e) => {
            if (e.key == "Enter" && e.shiftKey) {
              submitRequest();
            }
          }}
          sx={{
            width: "100%",
            align: "center",
          }}
          disabled={isProcessing}
        />
        <Button onClick={submitRequest}>Submit request</Button>
      </main>
    </div>
  );
}
