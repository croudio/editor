import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import Editor, { Props as EditorProps } from '../components/Editor';

export default {
  title: 'Example/Editor',
  component: Editor,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as Meta;

const Template: Story<EditorProps> = () => <Editor elements={[{ id: "Test", width: 10, height: 10, x: 4, y: 30 }]} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
