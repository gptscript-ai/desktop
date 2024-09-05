import React from 'react';
import { Button } from '@nextui-org/react';
import { GoPersonAdd } from 'react-icons/go';
import { createDefaultAssistant } from '@/actions/me/scripts';
import { useRouter } from 'next/navigation';

export default function Create() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    createDefaultAssistant().then((script) => {
      router.push(`/edit?id=${script?.id}`);
    });
  };

  return (
    <Button
      isLoading={loading}
      size="md"
      startContent={loading ? null : <GoPersonAdd />}
      color="primary"
      variant="flat"
      onPress={() => {
        setLoading(true);
        handleSubmit();
      }}
    >
      Create a new assistant
    </Button>
  );
}
