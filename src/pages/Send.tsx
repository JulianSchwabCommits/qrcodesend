import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  IconButton,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { QRCodeSVG } from 'qrcode.react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const Send = () => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState('qr.julianschwab.dev'); // Default fallback
  const toast = useToast();

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        const { data, error } = await supabase
          .from('config')
          .select('value')
          .eq('key', 'domain')
          .single();

        if (error) throw error;
        if (data) {
          setDomain(data.value);
        }
      } catch (error) {
        console.error('Error fetching domain:', error);
        // Keep using the default domain if there's an error
      }
    };

    fetchDomain();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{ content: message }])
        .select()
        .single();

      if (error) throw error;

      setMessageId(data.id);
      toast({
        title: 'Success',
        description: 'Message saved successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save message',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const messageUrl = messageId
    ? `https://${domain}/get/?id=${messageId}`
    : '';

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={12}>
        <Heading as="h1" size="2xl" textAlign="center" fontFamily="Playfair Display">
          Secret Message Sharing
        </Heading>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel fontSize="lg">Your Message</FormLabel>
              <InputGroup>
                <Input
                  type={isVisible ? 'text' : 'password'}
                  value={message}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                  placeholder="Enter your secret message..."
                  size="lg"
                  className="input-field"
                  _focus={{
                    borderColor: 'white',
                    boxShadow: '0 0 0 1px white',
                  }}
                />
                <InputRightElement h="full">
                  <IconButton
                    aria-label={isVisible ? 'Hide message' : 'Show message'}
                    icon={isVisible ? <FaEyeSlash /> : <FaEye />}
                    variant="ghost"
                    onClick={() => setIsVisible(!isVisible)}
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              w="100%"
              isLoading={isLoading}
              className="primary-button"
            >
              Generate QR Code
            </Button>
          </VStack>
        </form>

        {messageId && (
          <VStack spacing={6} w="100%" align="center">
            <Box
              p={8}
              bg="#2d2d2d"
              borderRadius="2xl"
              boxShadow="lg"
              border="1px solid #404040"
              className="card"
            >
              <QRCodeSVG value={messageUrl} size={256} />
            </Box>
            <Text fontSize="md" color="gray.400">
              Scan this QR code to view the message
            </Text>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(messageUrl);
                toast({
                  title: 'Copied!',
                  description: 'URL copied to clipboard',
                  status: 'success',
                  duration: 2000,
                });
              }}
              size="md"
              variant="secondary"
              className="secondary-button"
            >
              Copy URL
            </Button>
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default Send; 