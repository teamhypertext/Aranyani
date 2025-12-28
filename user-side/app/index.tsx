import { View, Text, ScrollView, SafeAreaView } from 'react-native';

const ColorCard = ({ name, bgClass, textClass = "text-foreground" }: { name: string, bgClass: string, textClass?: string }) => (
  <View className={`p-4 rounded-lg mb-4 border border-border ${bgClass} shadow-sm`}>
    <Text className={`font-medium ${textClass}`}>{name}</Text>
    <Text className={`text-xs opacity-70 ${textClass}`}>{bgClass}</Text>
  </View>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View className="mb-6">
    <Text className="text-xl font-bold mb-3 text-foreground">{title}</Text>
    <View className="flex-row flex-wrap gap-2">
        {children}
    </View>
  </View>
);

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-bold text-primary mb-6">Design System</Text>
        
        <Section title="Base Colors">
          <ColorCard name="Background" bgClass="bg-background" textClass="text-foreground" />
          <ColorCard name="Foreground" bgClass="bg-foreground" textClass="text-background" />
        </Section>

        <Section title="Primary">
          <ColorCard name="Primary" bgClass="bg-primary" textClass="text-primary-foreground" />
          <ColorCard name="Primary Foreground" bgClass="bg-primary-foreground" textClass="text-primary" />
        </Section>

        <Section title="Secondary">
          <ColorCard name="Secondary" bgClass="bg-secondary" textClass="text-secondary-foreground" />
          <ColorCard name="Secondary Foreground" bgClass="bg-secondary-foreground" textClass="text-secondary" />
        </Section>

        <Section title="Accent">
          <ColorCard name="Accent" bgClass="bg-accent" textClass="text-accent-foreground" />
          <ColorCard name="Accent Foreground" bgClass="bg-accent-foreground" textClass="text-accent" />
        </Section>

        <Section title="Muted">
          <ColorCard name="Muted" bgClass="bg-muted" textClass="text-muted-foreground" />
          <ColorCard name="Muted Foreground" bgClass="bg-muted-foreground" textClass="text-muted" />
        </Section>

        <Section title="Destructive">
          <ColorCard name="Destructive" bgClass="bg-destructive" textClass="text-destructive-foreground" />
          <ColorCard name="Destructive Foreground" bgClass="bg-destructive-foreground" textClass="text-destructive" />
        </Section>

        <Section title="Card">
          <ColorCard name="Card" bgClass="bg-card" textClass="text-card-foreground" />
          <ColorCard name="Card Foreground" bgClass="bg-card-foreground" textClass="text-card" />
        </Section>

        <Section title="Popover">
          <ColorCard name="Popover" bgClass="bg-popover" textClass="text-popover-foreground" />
          <ColorCard name="Popover Foreground" bgClass="bg-popover-foreground" textClass="text-popover" />
        </Section>

        <Section title="Sidebar">
            <ColorCard name="Sidebar" bgClass="bg-sidebar" textClass="text-sidebar-foreground" />
            <ColorCard name="Sidebar Primary" bgClass="bg-sidebar-primary" textClass="text-sidebar-primary-foreground" />
            <ColorCard name="Sidebar Accent" bgClass="bg-sidebar-accent" textClass="text-sidebar-accent-foreground" />
            <ColorCard name="Sidebar Border" bgClass="bg-sidebar-border" textClass="text-sidebar-foreground" />
        </Section>

        <Section title="Chart Colors">
            <View className="w-full grid grid-cols-2 gap-4">
                <ColorCard name="Chart 1" bgClass="bg-chart-1" textClass="text-white" />
                <ColorCard name="Chart 2" bgClass="bg-chart-2" textClass="text-white" />
                <ColorCard name="Chart 3" bgClass="bg-chart-3" textClass="text-white" />
                <ColorCard name="Chart 4" bgClass="bg-chart-4" textClass="text-white" />
                <ColorCard name="Chart 5" bgClass="bg-chart-5" textClass="text-white" />
            </View>
        </Section>

        <Section title="UI Elements">
            <View className="mb-4">
                 <Text className="text-secondary-foreground mb-2">Border</Text>
                 <View className="h-10 w-full border border-border rounded-md bg-background flex items-center justify-center">
                    <Text className="text-muted-foreground">Border Color</Text>
                 </View>
            </View>
            <View className="mb-4">
                 <Text className="text-secondary-foreground mb-2">Input</Text>
                 <View className="h-10 w-full bg-input rounded-md flex items-center justify-center">
                    <Text className="text-foreground">Input Background</Text>
                 </View>
            </View>
            <View className="mb-4">
                 <Text className="text-secondary-foreground mb-2">Ring</Text>
                 <View className="h-10 w-full border-4 border-ring rounded-md bg-background flex items-center justify-center">
                    <Text className="text-foreground">Ring Color</Text>
                 </View>
            </View>
        </Section>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
