import { useState, useEffect, useRef } from 'react';
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
  Tooltip,
} from '@chakra-ui/react';
import { QRCodeSVG } from 'qrcode.react';
import { FaEye, FaEyeSlash, FaDownload } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const Send = () => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState('qr.julianschwab.dev'); // Default fallback
  const [isHovering, setIsHovering] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
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

  const handleDownload = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const padding = 40; // Add 40px padding on each side

        img.onload = () => {
          canvas.width = img.width + (padding * 2);
          canvas.height = img.height + (padding * 2);

          // Fill white background
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Draw the QR code in the center
          ctx?.drawImage(img, padding, padding);
          const pngFile = canvas.toDataURL('image/png');

          const downloadLink = document.createElement('a');
          downloadLink.download = 'qrcode.png';
          downloadLink.href = pngFile;
          downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

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
              ref={qrRef}
              p={8}
              bg="white"
              borderRadius="2xl"
              boxShadow={isHovering ? 'xl' : 'lg'}
              border="1px solid #404040"
              className="card"
              position="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              transition="all 0.2s ease-in-out"
            >
              <QRCodeSVG value={messageUrl} size={256} />
              {isHovering && (
                <Tooltip label="Download QR Code">
                  <IconButton
                    aria-label="Download QR Code"
                    icon={<FaDownload />}
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    size="lg"
                    bg="white"
                    color="black"
                    opacity={0.9}
                    onClick={handleDownload}
                    _hover={{ opacity: 1, bg: 'white' }}
                  />
                </Tooltip>
              )}
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