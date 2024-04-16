import { HighlightStyle } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { codeColors as cc } from '../../components/theme'
import { theme as componentsTheme } from '../../components/theme'

export const codeColors = cc

export const codeStyle = HighlightStyle.define([
	{ tag: t.controlKeyword, color: codeColors.pink },
	{ tag: t.definitionKeyword, color: codeColors.blue },
	{ tag: t.modifier, color: codeColors.blue },
	{ tag: t.unit, color: codeColors.blue },
	{ tag: t.typeName, color: codeColors.blue },
	{ tag: t.function(t.variableName), color: codeColors.purple },
	{ tag: t.arithmeticOperator, color: codeColors.pink },
	{ tag: t.logicOperator, color: codeColors.pink },
	{ tag: t.bitwiseOperator, color: codeColors.pink },
	{ tag: t.compareOperator, color: codeColors.pink },
	{ tag: t.updateOperator, color: codeColors.pink },
	{ tag: t.lineComment, color: codeColors.gray },
	{ tag: t.blockComment, color: codeColors.gray },
	{ tag: t.integer, color: codeColors.orange },
	{ tag: t.float, color: codeColors.orange },
	{ tag: t.variableName, color: codeColors.lavender },
	{ tag: t.literal, color: codeColors.white },
	{ tag: t.processingInstruction, color: codeColors.pink },
	{ tag: t.paren, color: codeColors.light_gray },
	{ tag: t.squareBracket, color: codeColors.light_gray },
	{ tag: t.brace, color: codeColors.light_gray },
	{ tag: t.separator, color: codeColors.light_gray },
	{ tag: t.string, color: codeColors.purple }, // something wrong in glsl parser for this tag
	{ tag: t.labelName, color: '#f0f' }, // placeholder
	{ tag: t.function(t.definition(t.variableName)), color: '#f0f' }, // placeholder
	{ tag: t.operator, color: '#f0f' }, // placeholder
	{ tag: t.definitionOperator, color: '#f0f' }, // placeholder
	{ tag: t.special(t.propertyName), color: '#f0f' }, // placeholder
	{ tag: t.meta, color: '#f0f' }, // placeholder
	{ tag: t.bool, color: '#f0f' }, // placeholder
])

export const theme = componentsTheme
