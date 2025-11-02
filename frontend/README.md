# AgentOps Frontend Dashboard

A modern React dashboard for monitoring AI agents with the AgentOps platform - "PagerDuty for AI Agents".

## 🚀 Features

- **Authentication** - Secure login/register with backend integration
- **Dashboard** - Real-time metrics and system overview
- **API Key Management** - Create and manage API keys for agent integration
- **Documentation** - Interactive documentation with code examples
- **Monitoring** - Live charts for latency, throughput, and hallucination tracking
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Interactive charts and visualizations
- **React Query** - Server state management
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

## 📦 Installation

1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

4. **Configure your environment:**
```env
# AgentOps GCP Backend Configuration
REACT_APP_API_URL=https://agentops-api-1081133763032.us-central1.run.app

# Optional: Supabase Configuration (if using Supabase for auth)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. **Start the development server:**
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 🌐 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
- `REACT_APP_API_URL` - Your AgentOps backend URL
- `REACT_APP_SUPABASE_URL` - Supabase project URL (optional)
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key (optional)

## 📊 Features Overview

### Authentication
- User registration and login
- JWT token management
- Secure session handling

### Dashboard
- Real-time evaluation metrics
- System status indicators
- Quick action cards
- Recent activity overview

### API Key Management
- Create new API keys
- View existing keys
- Copy API keys to clipboard
- Delete unused keys

### Documentation
- Interactive API documentation
- Code examples in multiple languages
- Quick start guide
- Integration instructions

### Monitoring
- Live latency charts
- Throughput tracking
- Hallucination rate monitoring
- Agent performance comparison
- Time-series data visualization

## 🔧 Configuration

### API Endpoints
The frontend connects to the GCP backend at:
```
https://agentops-api-1081133763032.us-central1.run.app
```

### Available Endpoints
- `GET /health` - Health check
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/api-keys` - Create API key
- `GET /auth/api-keys` - List API keys
- `GET /evaluations/` - Get evaluation data
- `GET /evaluations/stats` - Get statistics
- `POST /metrics` - Upload evaluation metrics

## 🎨 Styling

The dashboard uses Tailwind CSS with a custom color scheme:

- **Primary**: AgentOps blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)

## 📱 Responsive Design

- **Desktop**: Full dashboard with sidebar navigation
- **Tablet**: Collapsible sidebar with touch-friendly controls
- **Mobile**: Bottom navigation with optimized layouts

## 🔒 Security

- JWT token-based authentication
- Secure API key storage
- HTTPS-only communication
- XSS protection with React
- Environment variable protection

## 🚀 Getting Started

1. **Create an account** on the registration page
2. **Generate an API key** from the API Keys section
3. **Integrate with your agent** using the provided SDK
4. **Monitor performance** in the Monitoring dashboard

## 📈 Integration Examples

### Python SDK
```python
from agentops import AgentOps

ops = AgentOps(
    api_key="your_api_key_here",
    api_url="https://agentops-api-1081133763032.us-central1.run.app"
)

result = ops.evaluate(
    prompt="What is AI?",
    response="AI is artificial intelligence..."
)
```

### cURL
```bash
curl -X POST https://agentops-api-1081133763032.us-central1.run.app/metrics \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "...", "response": "..."}'
```

## 🛠️ Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API service layer
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── styles/        # Global styles and Tailwind config
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see the main project LICENSE file for details.

## 🔗 Links

- **Backend API**: https://agentops-api-1081133763032.us-central1.run.app
- **Main Repository**: https://github.com/ezazahamad2003/agentops
- **PyPI Package**: https://pypi.org/project/agentops-client/

---

Built with ❤️ for the LLM community
