namespace TraditionalMedicalClinic.Models.Interfaces
{
    public interface IPageTMCLayout : IScriptSettings, IMetadataSettings
    {
        ContentReference Logo { get; set; }
        string FrontendBuildVersion { get; set; }
    }
}