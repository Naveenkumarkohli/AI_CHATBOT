import React from "react";

export default function Avatar({ role }) {
  const isUser = role === "user";
  const isError = role === "error";
  
  const getAvatarContent = () => {
    if (isUser) {
      return "👤";
    } else if (isError) {
      return "⚠️";
    } else {
      return "🤖";
    }
  };

  return (
    <div className="avatar">
      {getAvatarContent()}
    </div>
  );
}