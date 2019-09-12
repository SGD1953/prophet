/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {createScanner} from './parser/htmlScanner';
import {parse} from './parser/htmlParser';
import {doComplete} from './services/htmlCompletion';
import {doHover} from './services/htmlHover';
import {format} from './services/htmlFormatter';
import {findDocumentLinks} from './services/htmlLinks';
import {findDocumentHighlights} from './services/htmlHighlighting';
import {findDocumentSymbols} from './services/htmlSymbolsProvider';
import {TextDocument, Position, CompletionItem, CompletionList, Hover, Range, SymbolInformation, Diagnostic, TextEdit, DocumentHighlight, FormattingOptions, MarkedString, DocumentLink } from 'vscode-languageserver-types';
import { IConnection } from 'vscode-languageserver';

export {TextDocument, Position, CompletionItem, CompletionList, Hover, Range, SymbolInformation, Diagnostic, TextEdit, DocumentHighlight, FormattingOptions, MarkedString, DocumentLink };

export interface HTMLFormatConfiguration {
	tabSize?: number;
	insertSpaces?: boolean;
	wrapLineLength?: number;
	unformatted?: string;
	contentUnformatted?: string;
	indentInnerHtml?: boolean;
	wrapAttributes?: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline';
	preserveNewLines?: boolean;
	maxPreserveNewLines?: number;
	indentHandlebars?: boolean;
	endWithNewline?: boolean;
	extraLiners?: string;
}

export interface CompletionConfiguration {
	[provider: string]: boolean;
}

export interface Node {
	tag: string;
	start: number;
	end: number;
	endTagStart: number;
	children: Node[];
	parent: Node | undefined;
	attributes?: {[name: string]: string};
}


export enum TokenType {
	StartCommentTag,
	Comment,
	EndCommentTag,
	StartTagOpen,
	StartTagClose,
	StartTagSelfClose,
	StartTag,
	EndTagOpen,
	EndTagClose,
	EndTag,
	DelimiterAssign,
	AttributeName,
	AttributeValue,
	StartDoctypeTag,
	Doctype,
	EndDoctypeTag,
	Content,
	Whitespace,
	Unknown,
	Script,
	Styles,
	EOS
}

export enum ScannerState {
	WithinContent,
	AfterOpeningStartTag,
	AfterOpeningEndTag,
	WithinDoctype,
	WithinTag,
	WithinEndTag,
	WithinComment,
	WithinScriptContent,
	WithinStyleContent,
	AfterAttributeName,
	BeforeAttributeValue
}

export interface Scanner {
	scan(): TokenType;
	getTokenType(): TokenType;
	getTokenOffset(): number;
	getTokenLength(): number;
	getTokenEnd(): number;
	getTokenText(): string;
	getTokenError(): string;
	getScannerState(): ScannerState;
}

export declare type HTMLDocument = {
	roots: Node[];
	findNodeBefore(offset: number): Node;
	findNodeAt(offset: number): Node;
};

export interface DocumentContext {
	resolveReference(ref: string, base?: string): string;
}

export interface LanguageService {
	createScanner(input: string): Scanner;
	parseHTMLDocument(document: TextDocument): HTMLDocument;
	findDocumentHighlights(document: TextDocument, position: Position, htmlDocument: HTMLDocument): DocumentHighlight[];
	doComplete(document: TextDocument, position: Position, htmlDocument: HTMLDocument, options?: CompletionConfiguration): CompletionList;
	doHover(document: TextDocument, position: Position, htmlDocument: HTMLDocument): Hover | undefined;
	format(document: TextDocument, range: Range, options: HTMLFormatConfiguration, connection?: IConnection): TextEdit[];
	findDocumentLinks(document: TextDocument, documentContext: DocumentContext): DocumentLink[];
	findDocumentSymbols(document: TextDocument, htmlDocument: HTMLDocument): SymbolInformation[];
}

export function getLanguageService(): LanguageService {
	return {
		createScanner,
		parseHTMLDocument: document => parse(document.getText()),
		doComplete,
		doHover,
		format,
		findDocumentHighlights,
		findDocumentLinks,
		findDocumentSymbols
	};
}


