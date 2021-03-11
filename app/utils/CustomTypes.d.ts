

declare namespace CustomTypes {
    interface CommonInterface {
    }

    type looseObject = LooseObject;
    const looseObject: LooseObject;

    interface LooseObject extends Object {
        [key: string]: any
    }
}

declare module 'CustomTypes' {
    export = CustomTypes;
}