
import React from 'react';
import LoginForm from './LoginForm';
import { motion } from 'framer-motion';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            RewardAd
          </h1>
          <p className="text-muted-foreground">
            Admin Login
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginForm onToggleMode={() => {}} />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
