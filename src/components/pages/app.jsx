import { Helmet } from 'react-helmet-async';

// import { AppView } from 'src/sections/overview/view';
import { AppView } from '../overview/view';


// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> Hotel Roomsstay | Admin Panel </title>
      </Helmet>

      <AppView />
    </>
  );
}
