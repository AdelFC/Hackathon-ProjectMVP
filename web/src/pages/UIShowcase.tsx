import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table'
import { Skeleton, SkeletonText } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Tooltip } from '../components/ui/Tooltip'
import { useToast } from '../components/ui/Toast'

export default function UIShowcase() {
  const [modalOpen, setModalOpen] = useState(false)
  const { addToast } = useToast()
  
  const tableData = [
    { id: 1, name: 'Jean Dupont', email: 'jean@example.com', role: 'Admin' },
    { id: 2, name: 'Marie Martin', email: 'marie@example.com', role: 'User' },
    { id: 3, name: 'Pierre Bernard', email: 'pierre@example.com', role: 'User' },
  ]
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="section py-12">
        <h1 className="text-3xl font-bold mb-8">UI Kit Showcase</h1>
        
        <div className="space-y-12">
          {/* Buttons */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </section>
          
          {/* Badges */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Badges</h2>
            <div className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge size="sm">Small</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </section>
          
          {/* Cards */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Cards</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Card avec Header</h3>
                </CardHeader>
                <CardBody>
                  <p>Contenu de la carte avec header, body et footer.</p>
                </CardBody>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
              
              <Card variant="bordered">
                <CardBody>
                  <h3 className="font-semibold mb-2">Card avec bordure</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Variante avec bordure visible.
                  </p>
                </CardBody>
              </Card>
              
              <Card variant="elevated" hover>
                <CardBody>
                  <h3 className="font-semibold mb-2">Card avec élévation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Effet d'ombre et hover.
                  </p>
                </CardBody>
              </Card>
            </div>
          </section>
          
          {/* Modal */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Modal</h2>
            <Button onClick={() => setModalOpen(true)}>Ouvrir la modal</Button>
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Exemple de Modal"
              size="md"
            >
              <p>Contenu de la modal. Appuyez sur Échap ou cliquez en dehors pour fermer.</p>
              <div className="mt-4 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setModalOpen(false)}>
                  Confirmer
                </Button>
              </div>
            </Modal>
          </section>
          
          {/* Tabs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Tabs</h2>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Premier</TabsTrigger>
                <TabsTrigger value="tab2">Deuxième</TabsTrigger>
                <TabsTrigger value="tab3">Troisième</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <Card>
                  <CardBody>Contenu du premier onglet</CardBody>
                </Card>
              </TabsContent>
              <TabsContent value="tab2">
                <Card>
                  <CardBody>Contenu du deuxième onglet</CardBody>
                </Card>
              </TabsContent>
              <TabsContent value="tab3">
                <Card>
                  <CardBody>Contenu du troisième onglet</CardBody>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
          
          {/* Table */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Table</h2>
            <Card padding="none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>
                        <Badge variant={row.role === 'Admin' ? 'primary' : 'default'}>
                          {row.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">Éditer</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </section>
          
          {/* Skeleton */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Skeleton</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardBody>
                  <Skeleton variant="rectangular" height={100} className="mb-4" />
                  <Skeleton variant="text" className="mb-2" />
                  <Skeleton variant="text" className="mb-2" />
                  <Skeleton variant="text" width="60%" />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton variant="circular" />
                    <div className="flex-1">
                      <Skeleton variant="text" className="mb-2" />
                      <Skeleton variant="text" width="80%" />
                    </div>
                  </div>
                  <SkeletonText lines={3} />
                </CardBody>
              </Card>
            </div>
          </section>
          
          {/* Empty State */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Empty State</h2>
            <Card>
              <EmptyState
                title="Aucune donnée trouvée"
                description="Commencez par ajouter votre premier élément pour voir apparaître du contenu ici."
                action={<Button>Ajouter un élément</Button>}
              />
            </Card>
          </section>
          
          {/* Tooltip */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Tooltip</h2>
            <div className="flex gap-4">
              <Tooltip content="Tooltip en haut" position="top">
                <Button variant="outline">Haut</Button>
              </Tooltip>
              <Tooltip content="Tooltip en bas" position="bottom">
                <Button variant="outline">Bas</Button>
              </Tooltip>
              <Tooltip content="Tooltip à gauche" position="left">
                <Button variant="outline">Gauche</Button>
              </Tooltip>
              <Tooltip content="Tooltip à droite" position="right">
                <Button variant="outline">Droite</Button>
              </Tooltip>
            </div>
          </section>
          
          {/* Toast */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Toast</h2>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline"
                onClick={() => addToast('Message de succès', 'success')}
              >
                Toast Success
              </Button>
              <Button 
                variant="outline"
                onClick={() => addToast('Message d\'erreur', 'error')}
              >
                Toast Error
              </Button>
              <Button 
                variant="outline"
                onClick={() => addToast('Message d\'avertissement', 'warning')}
              >
                Toast Warning
              </Button>
              <Button 
                variant="outline"
                onClick={() => addToast('Message d\'information', 'info')}
              >
                Toast Info
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}