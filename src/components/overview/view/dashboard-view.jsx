import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Grid, Container, Typography, Skeleton } from "@mui/material";

import { role, localUrl } from "../../../../utils/util";

import AppWidgetSummary from "../app-widget-summary";
import { useLoader } from "../../../../utils/loader";
import HotelChart from "./hotel-chart";
import PartnerChart from "./partners-chart";
import Rooms from "src/components/rooms/Rooms";
import BookingChart from "./bookings-chart";

// ----------------------------------------------------------------------

export default function AppView() {
  const [hotelCount, setHotelCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      showLoader();
      try {
        const [bookingResponse, hotelResponse, userResponse] =
          await Promise.all([
            axios.get(`${localUrl}/get-all/bookings-count`),
            axios.get(`${localUrl}/get-hotels/count`),
            axios.get(`${localUrl}/get-total/user-details`),
          ]);

        setBookingCount(bookingResponse.data);
        setHotelCount(hotelResponse.data);
        setUserCount(userResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        hideLoader();
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const name = localStorage.getItem("user_name");

  const handleWidgetClick = (title) => {
    const routes = {
      Bookings: role === "PMS" ? "/your-bookings" : "/all-bookings",
      Hotels: "/your-hotels",
      Users: "/all-users",
      Reports: role === "Admin" ? "/complaints" : "/your-complaints",
      Notifications: "/notifications",
      Partners: "/partners",
      Messenger: "/messenger",
      Availability: role === "Admin" ? "/hotels/availability" : null,
      Coupons: "/apply-pms-coupon",
      "Monthly Price": "/hotels/monthly-price",
      "Travel locations": "/add-travel-location",
      Reviews: "/all-reviews",
    };
    const path = routes[title];
    if (path) {
      navigate(path);
    } else {
      console.warn("Unknown or unauthorized widget title:", title);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const widgets = [
    {
      title: "Bookings",
      count: bookingCount,
      color: "success",
      icon: "/assets/icons/glass/ic_glass_bag.png",
    },
    {
      title: "Users",
      count: userCount,
      color: "info",
      icon: "/assets/icons/glass/ic_glass_users.png",
    },
    {
      title: "Hotels",
      count: hotelCount,
      color: "warning",
      icon: "/assets/icons/glass/ic_glass_buy.png",
    },
    {
      title: "Reports",
      count: 234,
      color: "error",
      icon: "/assets/icons/glass/ic_glass_message.png",
    },
    {
      title: "Notifications",
      color: "success",
      icon: "https://static.vecteezy.com/system/resources/previews/009/394/760/non_2x/bell-icon-transparent-notification-free-png.png",
    },
    {
      title: "Partners",
      color: "info",
      icon: "https://www.iconpacks.net/icons/2/free-handshake-icon-3312-thumb.png",
    },
    {
      title: "Messenger",
      color: "warning",
      icon: "https://www.pngall.com/wp-content/uploads/5/Facebook-Messenger-Logo-PNG-HD-Image.png",
    },
    {
      title: "Coupons",
      color: "error",
      icon: "https://png.pngtree.com/png-vector/20220803/ourmid/pngtree-gift-voucher-coupon-design-png-image_6097745.png",
    },
    {
      title: "Availability",
      color: "error",
      icon: "https://www.freeiconspng.com/thumbs/check-tick-icon/tick-icon-30.png",
    },
    {
      title: "Monthly Price",
      color: "success",
      icon: "https://atlas-content-cdn.pixelsquid.com/stock-images/calendar-Q9V6xnA-600.jpg",
    },
    {
      title: "Travel locations",
      color: "info",
      icon: "https://www.freeiconspng.com/thumbs/travel-icon-png/plane-travel-flight-tourism-travel-icon-png-10.png",
    },
    {
      title: "Reviews",
      color: "warning",
      icon: "https://png.pngtree.com/png-vector/20230427/ourmid/pngtree-review-us-survey-star-scale-feedback-vector-png-image_6737386.png",
    },
  ];

  const filteredWidgets =
    role === "Admin"
      ? widgets
      : widgets.filter(
          (widget) =>
            ![
              "Users",
              "Partners",
              "Reviews",
              "Travel locations",
              "Notifications",
              "Availability",
            ].includes(widget.title),
        );

  return (
    <Container maxWidth="xl">
      {/* -- Header Section -- */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" component="h1">
          Hi, Welcome back {name} 👋
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {formattedDate} | {formattedTime}
        </Typography>
      </Box>
      {(role === "Admin" || role === "Developer") && (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={6}>
            <HotelChart />
          </Grid>
          <Grid item xs={12} md={6}>
            <PartnerChart />
          </Grid>
          <Grid item xs={12} md={12}>
            <BookingChart />
          </Grid>
        </Grid>
      )}

      {/* -- Charts Section -- */}

      {/* -- Dashboard Shortcuts Section -- */}
      <Typography variant="h5" sx={{ mb: 3 }}>
        Dashboard Shortcuts
      </Typography>
      <Grid container spacing={3}>
        {loading
          ? Array.from(new Array(4)).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Skeleton variant="rounded" height={160} />
              </Grid>
            ))
          : filteredWidgets.map((widget) => (
              <Grid item xs={12} sm={6} md={3} key={widget.title}>
                <AppWidgetSummary
                  title={widget.title}
                  total={widget.count || 0}
                  color={widget.color}
                  icon={<img alt={`${widget.title} icon`} src={widget.icon} />}
                  onClick={() => handleWidgetClick(widget.title)}
                />
              </Grid>
            ))}
      </Grid>

      {role === "PMS" && <Rooms />}
    </Container>
  );
}
