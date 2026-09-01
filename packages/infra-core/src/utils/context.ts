export class StackContext {

    public constructor(
        public readonly env: string,
        public readonly service: string,
        private readonly prefix: string
    ) { };

    get namespace() {
        return [this.env, this.service, this.prefix].join('-');
    }

    get id() {
        return this.prefix;
    }

    extend(prefix: string) {
        return new StackContext(this.env, this.service, `${this.prefix}-${prefix}`)
    }

    public static builder(env: string, service: string, prefix?: string) {
        return {
            stack: (id: string) => new StackContext(env, service, prefix ? `${prefix}-${id}` : id)
        }
    }

}

export default StackContext;