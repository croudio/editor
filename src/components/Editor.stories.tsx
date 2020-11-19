import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { Editor, EditorProps } from '../index';
import { duplicateSelection, moveSelection, deleteSelection, clearSelection, selectAll, setMode } from '../helpers/index';
import { onPointingCanvas, dragSelection, selectElement, onKeyDown, onKeyUp, moveSelectionWithCursorKeys } from '../plugins/index';
import { Mode } from '../typings';

export default {
  title: 'Editor',
  component: Editor,
  argTypes: {},
} as Meta;

const Template: Story<EditorProps> = (args: any) => {

  return <Editor {...args} />
};

export const Default = Template.bind({});
Default.args = {};

export const Basic = Template.bind({});
Basic.args = {
  elements: [{ id: "Test", width: 100, height: 25, x: 25, y: 50 }],
  size: { width: 300, height: 250 },
  grid: { width: 100, height: 50 },
  quantize: { width: 4, height: 2 }
};

export const WithPlugins = Template.bind({});
WithPlugins.args = {
  elements: [{ id: "Test", width: 100, height: 25, x: 25, y: 50 }],
  grid: { width: 100, height: 50 },
  quantize: { width: 4, height: 2 },
  plugins: [
    selectElement,
    onPointingCanvas(clearSelection),
    onKeyDown("command+d")(duplicateSelection),
    moveSelectionWithCursorKeys({ special: "shift" }),
    onKeyDown("backspace")(deleteSelection),
    onKeyDown("command+a")(selectAll),
    onKeyDown("esc")(clearSelection),
    onKeyDown("shift")(setMode(Mode.Special)),
    onKeyUp("shift")(setMode(Mode.Default)),
    dragSelection
  ]
};
