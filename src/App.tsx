import { ChakraProvider, CSSReset, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Send from './pages/Send';
import Get from './pages/Get';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#1a1a1a',
        color: 'white',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'full',
      },
      variants: {
        primary: {
          bg: '#e5e5e5',
          color: 'black',
          border: '1px solid black',
          _hover: {
            bg: 'black',
            color: 'white',
            border: '1px solid white',
          },
        },
        secondary: {
          bg: '#2d2d2d',
          color: 'white',
          border: '1px solid #404040',
          _hover: {
            bg: 'white',
            color: 'black',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'full',
          bg: '#2d2d2d',
          border: '1px solid #404040',
          _hover: {
            borderColor: 'white',
          },
          _focus: {
            borderColor: 'white',
            boxShadow: '0 0 0 1px white',
          },
        },
      },
    },
  },
  fonts: {
    heading: '"Playfair Display", serif',
    body: '"Inter", sans-serif',
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Router>
        <Routes>
          <Route path="/" element={<Send />} />
          <Route path="/get" element={<Get />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
