import { Helmet } from "react-helmet-async";

import TourData from "../../settings/tour/tour-list";

// ----------------------------------------------------------------------

export default function AllUserPages() {
  return (
    <>
      <Helmet>
        <title> Tour Data | Roomsstay </title>
      </Helmet>

      <TourData />
    </>
  );
}
