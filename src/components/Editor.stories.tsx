import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import Editor, { Props as EditorProps } from './Editor';

export default {
  title: 'Editor',
  component: Editor,
  argTypes: {},
} as Meta;

const Template: Story<EditorProps> = (args: any) => {

  return <Editor {...args} />
};

export const Default = Template.bind({});
Default.args = {
  elements: [{ id: "Test", width: 100, height: 25, x: 25, y: 50 }],
  size: { width: 300, height: 250 },
  grid: { width: 100, height: 50 },
  quantize: { width: 4, height: 2 }
};
