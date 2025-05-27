import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';

const Get = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchMessage = async () => {
      const id = searchParams.get('id');
      
      if (!id) {
        setError('No message ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('content')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          setError('Message not found');
        } else {
          setMessage(data.content);
        }
      } catch (err) {
        setError('Failed to retrieve message');
        toast({
          title: 'Error',
          description: 'Failed to retrieve message',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [searchParams, toast]);

  if (isLoading) {
    return (
      <Container maxW="container.md" py={20}>
        <VStack spacing={6}>
          <Spinner size="xl" color="white" />
          <Text fontSize="lg">Loading message...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={20}>
        <VStack spacing={6}>
          <Heading as="h1" size="xl" color="red.400" fontFamily="Playfair Display">
            Error
          </Heading>
          <Text fontSize="lg">{error}</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8}>
        <Heading as="h1" size="xl" fontFamily="Playfair Display">
          Secret Message
        </Heading>

        {message && (
          <Box
            p={8}
            bg="#2d2d2d"
            borderRadius="2xl"
            border="1px solid #404040"
            w="100%"
            transition="all 0.3s ease"
            _hover={{
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
            }}
          >
            <Text
              fontSize="lg"
              whiteSpace="pre-wrap"
            >
              {message}
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default Get; 