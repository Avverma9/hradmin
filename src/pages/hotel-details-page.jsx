import { Helmet } from 'react-helmet-async';

import HotelDetails from 'src/sections/products/view/hotel-details';



// ----------------------------------------------------------------------

export default function HotelDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Hotel Details | Roomsstay </title>
      </Helmet>

      <HotelDetails />
    </>
  );
}
