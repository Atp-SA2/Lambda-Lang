// Definição dos nós da AST para LambdaLang
export type Modifier = 'public' | 'private' | 'protected' | 'internal' | 'abstract' | 'static' | 'override' | 'final';

export interface ProgramNode {
  type: 'Program';
  body: ASTNode[];
}

export type ASTNode =
  | ClassDeclNode
  | InterfaceDeclNode
  | FieldDeclNode
  | MethodDeclNode
  | ConstructorDeclNode
  | StatementNode
  | ExpressionNode;

export interface ClassDeclNode {
  type: 'ClassDecl';
  name: string;
  modifiers: Modifier[];
  superClass?: string;
  interfaces?: string[];
  body: ASTNode[];
}

export interface InterfaceDeclNode {
  type: 'InterfaceDecl';
  name: string;
  modifiers: Modifier[];
  body: ASTNode[];
}

export interface FieldDeclNode {
  type: 'FieldDecl';
  name: string;
  varType: string;
  modifiers: Modifier[];
  value?: ExpressionNode;
}

export interface MethodDeclNode {
  type: 'MethodDecl';
  name: string;
  returnType: string;
  modifiers: Modifier[];
  params: ParamNode[];
  body: StatementNode[];
}

export interface ConstructorDeclNode {
  type: 'ConstructorDecl';
  name: string;
  modifiers: Modifier[];
  params: ParamNode[];
  body: StatementNode[];
}

export interface ParamNode {
  name: string;
  varType: string;
}

export interface StatementNode {
  type: string;
  [key: string]: any;
}

export interface ExpressionNode {
  type: string;
  [key: string]: any;
}
