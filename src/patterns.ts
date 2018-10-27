export default abstract class Patterns {
    public static block: RegExp = /([a-z-.#]+)[\s]*{[^}]*}/gmi;

    public static field: RegExp = /([a-z-]+):[\s]*([^;]+);/gmi;
}