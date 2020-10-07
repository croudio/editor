import React, { FC } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import Editor, { Props as EditorProps } from "./Editor"

const Template: Story<EditorProps> = (args) => <Editor {...args} />;

export const Basic = Template.bind({});
Basic.args = {};



export default {
    title: "Editor",
    component: Editor,
    // argTypes: {
    //     backgroundColor: { control: 'color' },
    // },
}