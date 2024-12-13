namespace TraditionalMedicalClinic.Cms.Interfaces
{
    public interface IScriptSettings
    {
        string ScriptsWithinTheHeadTag { get; set; }
        string ScriptsAfterOpeningBodyTag { get; set; }
        string ScriptsBeforeClosingBodyTag { get; set; }
    }
}
