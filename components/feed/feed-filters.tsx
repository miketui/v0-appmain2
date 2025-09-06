"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Globe, Users, Heart } from "lucide-react"

interface FeedFiltersProps {
  currentFilter: "all" | "house" | "following"
  onFilterChange: (filter: "all" | "house" | "following") => void
  onCreatePost: () => void
  userHouse?: string
}

export function FeedFilters({ currentFilter, onFilterChange, onCreatePost, userHouse }: FeedFiltersProps) {
  return (
    <Card className="bg-black/80 border-gold-500/20 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={currentFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => onFilterChange("all")}
              className={
                currentFilter === "all"
                  ? "bg-gradient-to-r from-gold-500 to-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }
            >
              <Globe className="w-4 h-4 mr-2" />
              All Posts
            </Button>

            {userHouse && (
              <Button
                variant={currentFilter === "house" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onFilterChange("house")}
                className={currentFilter === "house" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}
              >
                <Users className="w-4 h-4 mr-2" />
                My House
              </Button>
            )}

            <Button
              variant={currentFilter === "following" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onFilterChange("following")}
              className={currentFilter === "following" ? "bg-pink-600 text-white" : "text-gray-400 hover:text-white"}
            >
              <Heart className="w-4 h-4 mr-2" />
              Following
            </Button>
          </div>

          <Button
            onClick={onCreatePost}
            className="bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
