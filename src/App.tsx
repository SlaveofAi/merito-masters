
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import ApprovedBookings from "@/pages/ApprovedBookings";
import Categories from "@/pages/Categories";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster"
import TermsAndConditions from "@/pages/TermsAndConditions";
import ProfileCalendarPage from "@/pages/ProfilePages/ProfileCalendar";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/profile/calendar" element={<ProfileCalendarPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:section" element={<Profile />} />
        <Route path="/profile/:userId/:section" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:conversationId" element={<Messages />} />
        <Route path="/bookings" element={<ApprovedBookings />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
