import {  Info } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar"
import { Button } from "../ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card"

export function InfoModal() {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button className="p-0 pt-1 m-0" variant="link"><Info /></Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/zama-ai.png" />
              <AvatarFallback>ZAMA</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@zama-ai</h4>
              <p className="text-sm">
                Zama is pioneering homomorphic encryption to protect sensitive data while still allowing computations on encrypted data.
              </p>
              
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }