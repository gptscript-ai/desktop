'use client';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  User,
  Divider,
} from '@nextui-org/react';
import { useState, useEffect, useContext } from 'react';
import { GoPersonFill } from 'react-icons/go';
import Logout from '@/components/navbar/me/logout';
import { AuthContext } from '@/contexts/auth';
import { loginThroughTool } from '@/actions/auth/auth';
import { getMe } from '@/actions/me/me';
import Loading from '@/components/loading';

interface MeProps {
  className?: string;
}

const Me = ({ className }: MeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { authenticated, me, setMe, setAuthenticated } =
    useContext(AuthContext);
  const [_open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    authenticated && setOpen(false);
  }, [authenticated]);

  function handleLogin() {
    setLoading(true);
    loginThroughTool()
      .then(() =>
        getMe().then((me) => {
          setMe(me);
          setAuthenticated(true);
        })
      )
      .finally(() => setLoading(false));
  }

  return (
    <>
      <Popover
        placement="bottom-end"
        size="lg"
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
      >
        <PopoverTrigger>
          <Button
            radius="full"
            startContent={<GoPersonFill className="text-white" />}
            className={`${className}`}
            variant="flat"
            isIconOnly
          />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col p-4">
          {loading && (
            <Loading textSize="text-tiny" wheelSize="text-lg" spaceY="4">
              Logging you in...
            </Loading>
          )}
          {!loading && (
            <>
              {authenticated && (
                <>
                  <User
                    classNames={{
                      name: 'max-w-[200px] truncate',
                      description: 'max-w-[200px] truncate',
                    }}
                    name={`${me?.username}`}
                    description={`${me?.email}`}
                  />
                  <Divider className="my-2" />
                </>
              )}
              {authenticated ? (
                <Logout />
              ) : (
                <Button
                  className="w-full"
                  style={{ justifyContent: 'flex-start' }}
                  onPress={() => {
                    handleLogin();
                  }}
                  startContent={<GoPersonFill />}
                  variant="light"
                >
                  Login
                </Button>
              )}
              {authenticated && (
                <>
                  {/* <Button
                                    as={Link}
                                    style={{justifyContent: "flex-start"}}
                                    href="/"
                                    variant="light"
                                    startContent={<HiOutlineCog6Tooth/>}
                                    className="w-full"
                                >
                                    Settings
                                </Button> */}
                </>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
};

export default Me;
