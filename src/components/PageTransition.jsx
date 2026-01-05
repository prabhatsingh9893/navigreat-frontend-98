import React from 'react';
import { motion } from 'framer-motion';

// "World Class" Premium Animation Variants
const pageVariants = {
    initial: {
        opacity: 0,
        y: 15,
        filter: 'blur(8px)',
        scale: 0.98
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1.0], // Premium Cubic Bezier (similar to iOS)
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -15,
        filter: 'blur(8px)',
        scale: 0.98,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1.0]
        }
    }
};

const PageTransition = ({ children, className = "" }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className={`w-full min-h-screen ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
