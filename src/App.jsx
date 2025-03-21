import { useState, useRef, useEffect } from "react"; // Ajout de useRef et useEffect
import axios from "axios";
import {
  Container, TextField, Button, Typography, Box, Paper, Avatar, CssBaseline,
  List, ListItem, ListItemText, ListItemAvatar, Grid, CircularProgress, Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { green, blueGrey } from "@mui/material/colors";
import SendIcon from "@mui/icons-material/Send";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { motion } from "framer-motion";

// Gestion du mode sombre
const App = () => {
  const [darkMode, setDarkMode] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Référence pour le défilement automatique
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Définition du thème dynamique
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: green[500] },
      secondary: { main: blueGrey[500] },
    },
    typography: {
      fontFamily: "'Roboto', sans-serif",
      h4: { fontWeight: 700 },
    },
  });

  // Fonction pour envoyer la question
  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);

    // Ajouter la question de l'utilisateur à l'historique
    setMessages((prev) => [...prev, { text: question, isUser: true }]);

    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", { question });
      setMessages((prev) => [...prev, { text: res.data.answer, isUser: false }]);
      setError(null); // Réinitialiser l'erreur
    } catch (error) {
      console.error("Erreur :", error);
      setError("❌ Une erreur s'est produite. Vérifiez votre connexion !");
    } finally {
      setIsLoading(false);
      setQuestion(""); // Réinitialiser le champ de saisie
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "30px",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            width: { xs: "100%", sm: "100%" },
            height: { xs: "90vh", sm: "90vh" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: "50px",
              borderRadius: "12px",
              height: "90%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: theme.palette.background.paper,
            }}
            
          >
            {/* Titre et Avatar */}
            <Box textAlign="center" mb={2}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 60, height: 60, margin: "0 auto 10px" }}>
                🌐
              </Avatar>
              <Typography variant="h4" gutterBottom>
                Chatbot AYOUB
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Posez-moi une question, je suis là pour vous aider !
              </Typography>
            </Box>

            {/* Bouton Mode Sombre */}
            <Button
              variant="outlined"
              onClick={() => setDarkMode(!darkMode)}
              startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              sx={{ marginBottom: "10px" }}
            >
              {darkMode ? "Mode Clair ☀️" : "Mode Sombre 🌙"}
            </Button>

            {/* Affichage des erreurs */}
            {error && <Alert severity="error" sx={{ marginBottom: "10px" }}>{error}</Alert>}

            {/* Zone de discussion */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                marginBottom: "20px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: theme.palette.background.default,
              }}
            >
              <List>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListItem sx={{ justifyContent: message.isUser ? "flex-end" : "flex-start" }}>
                      <Box sx={{ display: "flex", flexDirection: message.isUser ? "row-reverse" : "row", alignItems: "center" }}>
                        {!message.isUser && (
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: blueGrey[500] }}>🤖</Avatar>
                          </ListItemAvatar>
                        )}
                        <Paper
                          elevation={3}
                          sx={{
                            padding: "10px 15px",
                            borderRadius: message.isUser ? "12px 12px 0 12px" : "12px 12px 12px 0",
                            backgroundColor: message.isUser ? green[500] : "#ffffff",
                            color: message.isUser ? "#ffffff" : "#000000",
                          }}
                        >
                          <ListItemText primary={message.text} />
                        </Paper>
                        {message.isUser && (
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: green[500] }}>👤</Avatar>
                          </ListItemAvatar>
                        )}
                      </Box>
                    </ListItem>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} /> {/* Point de référence pour le défilement */}
              </List>
            </Box>

            {/* Champ de saisie et bouton */}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={9}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Exemple : Comment fonctionne l'IA ?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isLoading}
                  multiline
                  rows={2}
                  InputProps={{ sx: { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleAsk}
                  disabled={isLoading}
                  endIcon={isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                  size="large"
                  sx={{ borderRadius: "8px", height: "100%" }}
                >
                  {isLoading ? "En cours..." : "Envoyer"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;