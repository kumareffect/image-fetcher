"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Image from "next/image"
import { drawArr, figArr, realArr } from "@/lib/image-data"
import { ArrowLeft, ArrowRight, Shuffle, Play, Pause, Settings, X, ChevronUp, ChevronDown } from "lucide-react"

export default function ImageGallery() {
  // Core state
  const [images, setImages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [category, setCategory] = useState("drawing")
  const [isLoading, setIsLoading] = useState(true)

  // Auto-transition settings
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false)
  const [transitionInterval, setTransitionInterval] = useState(1) // minutes
  const [showSettings, setShowSettings] = useState(false)

  // Refs
  const autoPlayIntervalRef = useRef(null)
  const imageRef = useRef(null)

  // IMPORTANT: Define navigation functions first to avoid initialization errors
  // Navigation functions - using useCallback to prevent unnecessary re-renders
  const goToNextImage = useCallback(() => {
    if (!images || images.length === 0) return

    setIsLoading(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [images])

  const goToPreviousImage = useCallback(() => {
    if (!images || images.length === 0) return

    setIsLoading(true)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }, [images])

  const goToRandomImage = useCallback(() => {
    if (!images || images.length === 0) return

    setIsLoading(true)
    const randomIndex = Math.floor(Math.random() * images.length)
    setCurrentIndex(randomIndex)
  }, [images])

  // Auto-play controls - defined AFTER navigation functions
  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlayEnabled((prev) => !prev)
  }, [])

  const resetAutoPlay = useCallback(() => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current)
    }

    if (images.length > 0) {
      const intervalMs = transitionInterval * 60 * 1000
      autoPlayIntervalRef.current = setInterval(() => {
        goToNextImage()
      }, intervalMs)
    }
  }, [transitionInterval, goToNextImage, images.length])

  // Category change handler
  const handleCategoryChange = useCallback((newCategory) => {
    setCategory(newCategory)
  }, [])

  // Interval controls
  const increaseInterval = useCallback(() => {
    setTransitionInterval((prev) => {
      const newValue = prev + 1
      return newValue > 60 ? 60 : newValue // Max 60 minutes
    })
  }, [])

  const decreaseInterval = useCallback(() => {
    setTransitionInterval((prev) => {
      const newValue = prev - 1
      return newValue < 0.5 ? 0.5 : newValue // Min 30 seconds (0.5 minutes)
    })
  }, [])

  // Toggle settings panel
  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev)
  }, [])

  // Image load handlers
  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleImageError = useCallback(() => {
    setIsLoading(false)
    console.error("Failed to load image")
  }, [])

  // Load images based on category
  useEffect(() => {
    let imageArray = []

    // Safely determine which array to use without destructuring
    if (category === "drawing") {
      imageArray = drawArr || []
    } else if (category === "figure") {
      imageArray = figArr || []
    } else if (category === "real") {
      imageArray = realArr || []
    }

    setImages(imageArray)
    setCurrentIndex(0)
    setIsLoading(true)

    // Reset autoplay when category changes
    if (isAutoPlayEnabled && autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current)

      // We'll set up the new interval in the auto-play effect
    }
  }, [category, isAutoPlayEnabled])

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event) {
      // Guard clause to prevent issues with undefined event
      if (!event) return

      const key = event.key

      if (key === "ArrowRight") {
        goToNextImage()
      } else if (key === "ArrowLeft") {
        goToPreviousImage()
      }
    }

    // Only add event listener on client side
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown)

      // Clean up event listener
      return function cleanup() {
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [goToNextImage, goToPreviousImage]) // Added navigation functions to dependencies

  // Setup auto-play functionality
  useEffect(() => {
    // Clear any existing interval
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current)
      autoPlayIntervalRef.current = null
    }

    // Set up new interval if auto-play is enabled
    if (isAutoPlayEnabled && images.length > 0) {
      const intervalMs = transitionInterval * 60 * 1000 // Convert minutes to milliseconds

      autoPlayIntervalRef.current = setInterval(() => {
        goToNextImage()
      }, intervalMs)

      // Clean up interval on unmount
      return function cleanup() {
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current)
        }
      }
    }
  }, [isAutoPlayEnabled, transitionInterval, images.length, goToNextImage])

  // Update interval when transition interval changes
  useEffect(() => {
    if (isAutoPlayEnabled && autoPlayIntervalRef.current) {
      resetAutoPlay()
    }
  }, [transitionInterval, isAutoPlayEnabled, resetAutoPlay])

  // Current image URL with safety checks
  const currentImageUrl = images && images.length > 0 && currentIndex < images.length ? images[currentIndex] : null

  // Format time display
  const formatTimeDisplay = (minutes) => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} seconds`
    }
    return minutes === 1 ? "1 minute" : `${minutes} minutes`
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Pinterest Gallery</h1>

      {/* Category Selection */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            category === "drawing"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          } hover:bg-blue-500 hover:text-white transition-colors`}
          onClick={() => handleCategoryChange("drawing")}
        >
          Drawings
        </button>
        <button
          className={`px-4 py-2 rounded ${
            category === "figure"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          } hover:bg-blue-500 hover:text-white transition-colors`}
          onClick={() => handleCategoryChange("figure")}
        >
          Figures
        </button>
        <button
          className={`px-4 py-2 rounded ${
            category === "real"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          } hover:bg-blue-500 hover:text-white transition-colors`}
          onClick={() => handleCategoryChange("real")}
        >
          Real
        </button>
      </div>

      {/* Image Display */}
      <div className="relative w-full max-w-2xl aspect-[3/4] rounded-lg overflow-hidden shadow-xl mb-6" ref={imageRef}>
        {currentImageUrl ? (
          <Image
            src={currentImageUrl || "/placeholder.svg"}
            alt={`Pinterest image from ${category} category`}
            fill
            className="object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <p>No image available</p>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Image counter overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
          <div className="flex justify-between items-center">
            <p className="text-white text-sm">
              Image {currentIndex + 1} of {images.length}
            </p>
            {isAutoPlayEnabled && (
              <p className="text-white text-sm bg-blue-600 px-2 py-1 rounded-full">
                Auto: {formatTimeDisplay(transitionInterval)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        <button
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          onClick={goToPreviousImage}
          aria-label="Previous image"
          id="prev-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          onClick={goToRandomImage}
          aria-label="Random image"
        >
          <Shuffle className="w-5 h-5" />
        </button>
        <button
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          onClick={goToNextImage}
          aria-label="Next image"
          id="next-button"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          className={`p-3 rounded-full ${
            isAutoPlayEnabled
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          } transition-colors`}
          onClick={toggleAutoPlay}
          aria-label={isAutoPlayEnabled ? "Pause auto-play" : "Start auto-play"}
        >
          {isAutoPlayEnabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          className={`p-3 rounded-full ${
            showSettings
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          } transition-colors`}
          onClick={toggleSettings}
          aria-label="Settings"
        >
          {showSettings ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6 animate-fadeIn">
          <h2 className="text-lg font-semibold mb-3">Gallery Settings</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Auto-Transition Interval</label>
            <div className="flex items-center">
              <button
                className="p-2 rounded-l bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={decreaseInterval}
                aria-label="Decrease interval"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 flex-1 text-center">
                {formatTimeDisplay(transitionInterval)}
              </div>
              <button
                className="p-2 rounded-r bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={increaseInterval}
                aria-label="Increase interval"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <button
              className={`flex-1 py-2 px-4 rounded ${
                isAutoPlayEnabled
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
              onClick={toggleAutoPlay}
            >
              {isAutoPlayEnabled ? "Disable Auto-Play" : "Enable Auto-Play"}
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Use arrow keys to navigate: ← Previous | Next →</p>
    </div>
  )
}
