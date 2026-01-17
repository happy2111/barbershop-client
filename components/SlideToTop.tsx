import React from 'react'
import {Button} from "@/components/ui/button";
import {ChevronUp} from "lucide-react";

const SlideToTop = () => {
  return (
    <div className='p-2 flex items-center justify-center bg-accent rounded-full fixed bottom-3 right-3 '>
      <Button onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        })
      }}
              className="rounded-full p-4 w-9 h-9"
      >
        <ChevronUp />
      </Button>
    </div>

  )
}
export default SlideToTop
