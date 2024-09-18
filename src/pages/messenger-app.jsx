import { Helmet } from 'react-helmet-async';

import ChatApp from 'src/sections/messenger/messenger';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Messenger | Roomsstay </title>
      </Helmet>

      <ChatApp />
    </>
  );
}
