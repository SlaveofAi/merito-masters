
import React from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/chat/Chat";

const Messages = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <h1 className="text-2xl font-bold mb-6">Správy</h1>
        <Chat />
      </div>
    </Layout>
  );
};

export default Messages;
