'use client';

import { useContext } from 'react';
import { logout } from '@/actions/auth/auth';
import { Button } from '@nextui-org/react';
import { AuthContext } from '@/contexts/auth';
import { GoPersonFill } from 'react-icons/go';

export default function Login() {
  const { setAuthenticated } = useContext(AuthContext);

  return (
    <Button
      className="w-full"
      style={{ justifyContent: 'flex-start' }}
      startContent={<GoPersonFill />}
      variant="light"
      onClick={() =>
        logout().then(() => {
          setAuthenticated(false);
        })
      }
    >
      Logout
    </Button>
  );
}
