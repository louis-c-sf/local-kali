import React from 'react';

import { ScrollArea, ScrollAreaViewportProps } from '@/components/ScrollArea';
import { testIds } from '@/playwright/lib/test-ids';

const ConversationListVirtualOuterElementType = React.forwardRef<
  HTMLUListElement,
  {
    children: React.ReactNode;
  } & ScrollAreaViewportProps
>(function OuterElementType({ children, style, ...rest }, ref) {
  return (
    <ScrollArea
      data-testid={testIds.inboxSearchConversationList}
      slotProps={{
        root: {
          style: {
            width: style?.width,
            flex: '1 1 auto',
          },
        },
        viewport: {
          //@ts-expect-error incorrect type inferrance
          ref,
          ...rest,
          style: {
            ...style,
            overflowY: 'unset',
            overflowX: 'unset',
            listStyle: 'none',
          },
        },
      }}
    >
      {children}
    </ScrollArea>
  );
});

export default ConversationListVirtualOuterElementType;
