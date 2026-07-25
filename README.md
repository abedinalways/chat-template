# Chat Template - Real-time Messaging System

A production-ready, scalable real-time messaging template built with Next.js, Socket.io, Redux Toolkit, and TypeScript. This template provides a complete chat system that can be easily integrated into any project.

## ✨ Features

- **Real-time Messaging**: Instant message delivery using Socket.io
- **Typing Indicators**: See when others are typing
- **Message Status**: Track message states (sending, sent, delivered, read)
- **Unread Counts**: Per-conversation and total unread message tracking
- **Notifications**: In-app, browser, and sound notifications
- **Conversation Management**: Search, filter, and manage conversations
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **TypeScript**: Full type safety across the entire codebase
- **Redux Toolkit**: Centralized state management with RTK Query
- **SSR-Safe**: Works with Next.js App Router and server components

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐      ┌──────────────┐               │
│  │   Chat UI    │◄────►│  Redux Store │               │
│  │ Components   │      │  + RTK Query │               │
│  └──────┬───────┘      └──────┬───────┘               │
│         │                     │                         │
│         │              ┌──────▼───────┐                │
│         │              │ Chat Slice  │                │
│         │              │ (State)     │                │
│         │              └─────────────┘                │
│         │                                               │
│  ┌──────▼──────────────────────────┐                   │
│  │   useChatSocket Hook            │                   │
│  │   (Socket.io Integration)       │                   │
│  └──────┬──────────────────────────┘                   │
│         │                                               │
│  ┌──────▼──────────────────────────┐                   │
│  │   SocketService (Singleton)     │                   │
│  │   - Connection management       │                   │
│  │   - Event listeners             │                   │
│  │   - Auto-reconnection           │                   │
│  └──────┬──────────────────────────┘                   │
│         │                                               │
│         └───────────────► Socket.io Client             │
│                          (WebSocket)                    │
└─────────────────────────────────────────────────────────┘
```

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **State Management**: Redux Toolkit + RTK Query
- **Real-time**: Socket.io Client
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Build Tool**: Next.js built-in

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Socket.io server running (backend)
- A REST API server for chat endpoints

### Installation

1. **Clone or copy this template into your project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and update the values:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the following variables in `.env.local`:
   - `NEXT_PUBLIC_API_URL`: Your REST API base URL
   - `NEXT_PUBLIC_SOCKET_URL`: Your Socket.io server URL

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
chat-template/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page
│   └── providers.tsx            # Redux & other providers
│
├── components/
│   ├── chat/                    # Chat UI components
│   │   ├── ChatProvider.tsx     # Context provider for chat state
│   │   ├── ChatContainer.tsx    # Main chat container
│   │   ├── ChatHeader.tsx       # Conversation header
│   │   ├── ChatMessages.tsx     # Messages list with auto-scroll
│   │   ├── MessageBubble.tsx    # Individual message component
│   │   ├── MessageInput.tsx     # Message input with typing
│   │   ├── ConversationList.tsx # Sidebar with conversations
│   │   ├── NotificationBell.tsx # Notification dropdown
│   │   └── NotificationSound.tsx # Sound notification handler
│   │
│   ├── notification/            # Generic notification components
│   │   └── NotificationBell.tsx
│   │
│   └── ui/                      # Reusable UI components
│       └── Loader.tsx
│
├── hooks/                       # Custom React hooks
│   ├── useChatSocket.ts         # Socket.io integration
│   ├── useDebounce.ts           # Debounce utility
│   └── useNotification.ts       # Notification management
│
├── lib/                         # Utility libraries
│   ├── socket.ts                # Socket.io singleton service
│   └── notification.ts          # Browser notification utilities
│
├── redux/                       # Redux state management
│   ├── store.ts                 # Redux store configuration
│   └── api/
│       └── chat/
│           ├── chatApi.ts       # RTK Query API endpoints
│           └── chatSlice.ts     # Chat state slice
│
├── types/                       # TypeScript type definitions
│   ├── chat.ts                  # Chat-related types
│   └── notification.ts          # Notification types
│
└── public/                      # Static assets
```

## 🔧 Core Components

### SocketService (`lib/socket.ts`)

Singleton service that manages the Socket.io connection:

```typescript
import { SocketService } from '@/lib/socket';

// Initialize the socket connection
const socket = SocketService.getInstance({
  url: process.env.NEXT_PUBLIC_SOCKET_URL,
  token: 'user-auth-token',
  autoConnect: true,
});

// Listen to events
const unsubscribe = socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Emit events
socket.emit('joinRoom', { conversationId, userId });

// Clean up
unsubscribe();
socket.disconnect();
```

### useChatSocket Hook (`hooks/useChatSocket.ts`)

React hook that wires Socket.io events to Redux:

```typescript
import { useChatSocket } from '@/hooks/useChatSocket';

function ChatComponent() {
  const { 
    isConnected, 
    joinRoom, 
    leaveRoom, 
    emitTyping, 
    markMessageRead 
  } = useChatSocket();

  // Join a conversation room
  useEffect(() => {
    if (conversationId) {
      joinRoom(conversationId);
      return () => leaveRoom(conversationId);
    }
  }, [conversationId, joinRoom, leaveRoom]);

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
}
```

### ChatProvider (`components/chat/ChatProvider.tsx`)

Context provider that combines Redux, RTK Query, and Socket.io:

```typescript
import { ChatProvider, useChat } from '@/components/chat/ChatProvider';

// Wrap your app with ChatProvider
<ChatProvider>
  <YourApp />
</ChatProvider>

// Use the chat context in components
function ChatComponent() {
  const {
    conversations,
    messages,
    activeConversationId,
    sendMessage,
    selectConversation,
    isConnected,
  } = useChat();

  // Use chat functionality
}
```

## 🔌 Socket Events

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `newMessage` | `Message` | New message received |
| `typing` | `{ conversationId, userId, isTyping }` | User typing indicator |
| `messageRead` | `{ messageId, userId }` | Message read receipt |
| `connect` | - | Socket connected |
| `disconnect` | `string` (reason) | Socket disconnected |
| `connect_error` | `Error` | Connection error |

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `{ conversationId, userId }` | Join a conversation room |
| `leaveRoom` | `{ conversationId, userId }` | Leave a conversation room |
| `typing` | `{ conversationId, userId, isTyping }` | Emit typing indicator |
| `sendMessage` | `Omit<Message, 'id' | 'status' | 'createdAt'>` | Send a message |
| `markRead` | `{ messageId, conversationId }` | Mark message as read |

## 🎨 Customization

### Styling

All components use Tailwind CSS classes. Customize the look by:

1. Modifying Tailwind classes in components
2. Updating the Tailwind config in `tailwind.config.ts`
3. Adding custom CSS in `app/globals.css`

### Configuration

Customize chat behavior via the `ChatConfig` type:

```typescript
interface ChatConfig {
  showHeader?: boolean;              // Show/hide chat header
  showConversationList?: boolean;    // Show/hide conversation sidebar
  enableAttachments?: boolean;       // Enable file attachments
  enableVoiceMessages?: boolean;     // Enable voice messages
  maxMessages?: number;              // Max messages to load
}
```

### Extending Types

Add new message types or socket events in `types/chat.ts`:

```typescript
// Add new socket events
export interface SocketEvents {
  // ... existing events
  newEvent: (data: YourDataType) => void;
}

export interface SocketEmitEvents {
  // ... existing events
  newEvent: (data: YourDataType) => void;
}
```

## 🔒 Authentication

The socket connection uses token-based authentication:

```typescript
const socket = SocketService.getInstance({
  url: process.env.NEXT_PUBLIC_SOCKET_URL,
  token: localStorage.getItem('token'), // JWT or similar
});
```

The token is sent via Socket.io's `auth` option and should be validated on the server.

## 📱 Responsive Design

The chat UI is fully responsive:

- **Desktop**: Full layout with sidebar
- **Tablet**: Collapsible sidebar
- **Mobile**: Full-screen conversations with back navigation

## 🧪 Testing

### Manual Testing Checklist

- [ ] Socket connection establishes successfully
- [ ] Messages appear in real-time
- [ ] Typing indicators work
- [ ] Unread counts update correctly
- [ ] Notifications appear (in-app, browser, sound)
- [ ] Auto-scroll works when at bottom
- [ ] Load more messages works
- [ ] Conversation search works
- [ ] Message status updates (sending → sent → delivered → read)

## 🐛 Common Issues

### Socket not connecting

1. Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
2. Ensure Socket.io server is running
3. Check browser console for errors
4. Verify CORS settings on server

### Messages not appearing

1. Check Redux DevTools for state updates
2. Verify socket event listeners are registered
3. Check network tab for API calls
4. Ensure message IDs are unique

### Notifications not working

1. Request notification permission in browser
2. Check if tab is hidden (browser notifications only work when hidden)
3. Verify notification sound file exists

## 📚 Best Practices

1. **Always use the ChatProvider** - Don't access Redux directly for chat state
2. **Clean up listeners** - Use the unsubscribe functions returned by `socket.on()`
3. **SSR Safety** - Always check `typeof window !== 'undefined'` before using browser APIs
4. **Error Handling** - Wrap socket operations in try-catch blocks
5. **Type Safety** - Use the provided TypeScript types, don't use `any`

## 🚢 Production Deployment

### Environment Variables

Set these in your production environment:

```env
NEXT_PUBLIC_API_URL=https://your-api.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.com
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### Socket.io Server Configuration

Ensure your Socket.io server has:

- CORS configured for your domain
- Authentication middleware for socket connections
- Proper room management
- Rate limiting to prevent abuse

### Performance Optimization

- Enable Next.js Image Optimization
- Use CDN for static assets
- Implement message pagination
- Cache conversation lists
- Use Redis for Socket.io adapter (if scaling)

## 📄 License

This template is open source and available for use in any project.

## 🤝 Contributing

Feel free to submit issues and enhancement requests.

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using Next.js, Socket.io, and Redux Toolkit**