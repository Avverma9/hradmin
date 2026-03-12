import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Container, Typography, Skeleton } from "@mui/material";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FlightTakeoffOutlinedIcon from "@mui/icons-material/FlightTakeoffOutlined";
import ReviewsOutlinedIcon from "@mui/icons-material/ReviewsOutlined";
import { role, localUrl } from "../../../../utils/util";
import AppWidgetSummary from "../app-widget-summary";
import { useLoader } from "../../../../utils/loader";
import HotelChart from "./hotel-chart";
import PartnerChart from "./partners-chart";
import Rooms from "src/components/rooms/Rooms";
import BookingChart from "./bookings-chart";

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

  const name = sessionStorage.getItem("user_name");
  const authItems = JSON.parse(sessionStorage.getItem("auth_items")) || [];
  const filtered = authItems.map((item) => item.title);
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
      "Monthly Price": "/hotels/monthly-price-pms",
      "Travel locations": "/add-travel-location",
      Reviews: "/all-reviews",
    };
    const path = routes[title];
    if (path) {
      navigate(path);
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
      icon: <NotificationsActiveOutlinedIcon sx={{ width: 56, height: 56 }} />,
    },
    {
      title: "Partners",
      color: "info",
      icon: <HandshakeOutlinedIcon sx={{ width: 56, height: 56 }} />,
    },
    {
      title: "Messenger",
      color: "warning",
      icon: <ForumOutlinedIcon sx={{ width: 56, height: 56 }} />,
    },
    {
      title: "Coupons",
      color: "error",
      icon: <LocalOfferOutlinedIcon sx={{ width: 56, height: 56 }} />,
    },
    {
      title: "Availability",
      color: "error",
      icon: <CheckCircleOutlineOutlinedIcon sx={{ width: 56, height: 56 }} />,
    },
    {
      title: "Monthly Price",
      color: "success",
      icon: <CalendarMonthOutlinedIcon sx={{ width: 56, height: 56 }} />,
    },
    {
      title: "Travel locations",
      color: "info",
      icon: <FlightTakeoffOutlinedIcon sx={{ width: 56, height: 56 }} />,
    },
    {
      title: "Reviews",
      color: "warning",
      icon: <ReviewsOutlinedIcon sx={{ width: 56, height: 56 }} />,
    },
  ];

  const menuToWidgetMap = {
    "PMS Bookings": "Bookings",
    "PMS Hotels": "Hotels",
    "PMS Complaints": "Reports",
    Messenger: "Messenger",
    "PMS Coupons": "Coupons",
    "PMS Monthly Price": "Monthly Price",
    Dashboard: null,
  };

  const userRole = sessionStorage.getItem("user_role");
  const allowedWidgetTitles = filtered
    .map((item) => menuToWidgetMap[item])
    .filter(Boolean);

  const filteredWidgets =
    userRole === "Admin" || userRole === "Developer"
      ? widgets
      : widgets.filter((widget) => allowedWidgetTitles.includes(widget.title));

  return (
    <Container maxWidth="xl">
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
                  icon={
                    typeof widget.icon === "string" ? (
                      <img alt={`${widget.title} icon`} src={widget.icon} />
                    ) : (
                      widget.icon
                    )
                  }
                  onClick={() => handleWidgetClick(widget.title)}
                />
              </Grid>
            ))}
      </Grid>

      {role === "PMS" && <Rooms />}
    </Container>
  );
}
