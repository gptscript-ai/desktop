'use client';

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/auth';
import Scripts from '@/components/scripts';
import Loading from '@/components/loading';
import { NavContext } from '@/contexts/nav';
import { GoPeople } from 'react-icons/go';
import Create from '@/components/scripts/create';
import { Button, Divider, useDisclosure } from '@nextui-org/react';
import { MdOutlineTravelExplore } from 'react-icons/md';
import ExploreModal from '@/components/explore/ExploreModal';

export default function Home() {
  const { loading } = useContext(AuthContext);
  const { setCurrent } = useContext(NavContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  useEffect(() => setCurrent('/build'), []);
  if (loading) return <Loading />;
  return (
    <section className="w-full gap-4 h-full overflow-auto">
      <div className="sticky top-0 space-y-4 z-20 bg-background px-20 py-5 border-b-1 dark:border-zinc-800">
        <div className="flex justify-between">
          <h1 className="text-4xl font-bold text-primary-400">
            <GoPeople className="inline mb-2 mr-1 text-5xl" /> My Assistants
          </h1>

          <div>
            <Create />
            <Button
              isLoading={loading}
              size="md"
              startContent={<MdOutlineTravelExplore />}
              color="primary"
              variant="flat"
              className="ml-2"
              onPress={() => {
                onOpen();
              }}
            >
              Assistant Catalog
            </Button>
          </div>
        </div>

        <div className="flex h-5 items-center space-x-4 text-medium text-zinc-500">
          <div
            className={`cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 ${!showFavorites ? 'font-bold text-zinc-900 dark:text-white' : ''}`}
            onClick={() => setShowFavorites(false)}
          >
            My Assistants
          </div>

          <Divider orientation="vertical" />

          <div
            className={`cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 ${showFavorites ? 'font-bold text-zinc-900 dark:text-white' : ''}`}
            onClick={() => setShowFavorites(true)}
          >
            Favorites
          </div>
        </div>
      </div>

      <div className="w-full pt-8 pb-24 px-20 h-full">
        <Scripts showFavorites={showFavorites} />
      </div>

      <ExploreModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </section>
  );
}
